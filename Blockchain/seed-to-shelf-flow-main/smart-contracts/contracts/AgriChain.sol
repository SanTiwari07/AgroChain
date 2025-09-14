// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title KrishiSetu
 * @dev Smart contract for agricultural supply chain transparency
 * @author SIH Team - Agricultural Blockchain Solution
 */
contract KrishiSetu {
    
    // Product structure to store all product information
    struct Product {
        string id;              // Unique product ID
        string name;            // Product name (e.g., "Wheat", "Rice")
        uint256 quantity;       // Quantity in kg
        uint256 basePrice;      // Original price from farmer (in wei)
        uint256 currentPrice;   // Current price after all additions
        string harvestDate;     // Harvest date string
        string quality;         // Quality grade: A, B, or C
        string status;          // Current status in supply chain
        address farmer;         // Farmer's wallet address
        address distributor;    // Distributor's wallet address
        address retailer;       // Retailer's wallet address
        string location;        // Farm location
        uint256 timestamp;      // Registration timestamp
        bool exists;            // Flag to check if product exists
    }
    
    // Transaction history structure
    struct Transaction {
        string productId;       // Associated product ID
        address actor;          // Address of person making transaction
        string action;          // Action performed
        uint256 newPrice;       // Price after this transaction
        string details;         // Additional details
        uint256 timestamp;      // Transaction timestamp
        uint256 blockNumber;    // Block number for verification
    }
    
    // State variables
    mapping(string => Product) public products;                    // Product ID => Product
    mapping(string => Transaction[]) public productHistory;       // Product ID => Transaction[]
    mapping(address => string[]) public farmerProducts;           // Farmer => Product IDs
    mapping(address => string[]) public distributorProducts;      // Distributor => Product IDs
    mapping(address => string[]) public retailerProducts;         // Retailer => Product IDs
    
    string[] public allProductIds;      // Array of all product IDs
    uint256 public totalProducts;       // Total number of products
    uint256 public totalTransactions;   // Total number of transactions
    
    // Events for transparency and tracking
    event ProductRegistered(
        string indexed productId,
        address indexed farmer,
        string name,
        uint256 quantity,
        uint256 basePrice,
        string quality,
        string location
    );
    
    event ProductUpdated(
        string indexed productId,
        address indexed actor,
        string action,
        uint256 newPrice,
        string status
    );
    
    event SupplyChainStep(
        string indexed productId,
        address indexed from,
        address indexed to,
        string step,
        uint256 timestamp
    );
    
    // Modifiers for access control
    modifier productExists(string memory _productId) {
        require(products[_productId].exists, "Product does not exist");
        _;
    }
    
    modifier onlyFarmer(string memory _productId) {
        require(products[_productId].farmer == msg.sender, "Only farmer can perform this action");
        _;
    }
    
    modifier validStatus(string memory _productId, string memory _requiredStatus) {
        require(
            keccak256(bytes(products[_productId].status)) == keccak256(bytes(_requiredStatus)),
            "Invalid product status for this operation"
        );
        _;
    }
    
    /**
     * @dev Register a new product on the blockchain (Farmer only)
     * @param _id Unique product identifier
     * @param _name Product name
     * @param _quantity Quantity in kg
     * @param _basePrice Base price per kg in wei
     * @param _harvestDate Harvest date
     * @param _quality Quality grade (A/B/C)
     * @param _location Farm location
     */
    function registerProduct(
        string memory _id,
        string memory _name,
        uint256 _quantity,
        uint256 _basePrice,
        string memory _harvestDate,
        string memory _quality,
        string memory _location
    ) public {
        require(!products[_id].exists, "Product with this ID already exists");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(_basePrice > 0, "Base price must be greater than 0");
        require(bytes(_name).length > 0, "Product name cannot be empty");
        
        // Create new product
        products[_id] = Product({
            id: _id,
            name: _name,
            quantity: _quantity,
            basePrice: _basePrice,
            currentPrice: _basePrice,
            harvestDate: _harvestDate,
            quality: _quality,
            status: "Available for Distribution",
            farmer: msg.sender,
            distributor: address(0),
            retailer: address(0),
            location: _location,
            timestamp: block.timestamp,
            exists: true
        });
        
        // Update tracking arrays
        allProductIds.push(_id);
        farmerProducts[msg.sender].push(_id);
        totalProducts++;
        
        // Add initial transaction
        productHistory[_id].push(Transaction({
            productId: _id,
            actor: msg.sender,
            action: "Product Registered",
            newPrice: _basePrice,
            details: string(abi.encodePacked("Registered at ", _location)),
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        
        totalTransactions++;
        
        emit ProductRegistered(_id, msg.sender, _name, _quantity, _basePrice, _quality, _location);
        emit SupplyChainStep(_id, address(0), msg.sender, "Registration", block.timestamp);
    }
    
    /**
     * @dev Update product as distributor (Transport phase)
     * @param _productId Product ID to update
     * @param _handlingCost Additional cost for handling/transport
     * @param _transportDetails Transport details (truck ID, driver, etc.)
     */
    function updateAsDistributor(
        string memory _productId,
        uint256 _handlingCost,
        string memory _transportDetails
    ) public productExists(_productId) validStatus(_productId, "Available for Distribution") {
        Product storage product = products[_productId];
        
        // Update product details
        product.distributor = msg.sender;
        product.currentPrice += _handlingCost;
        product.status = "In Transit";
        
        // Add to distributor's products
        distributorProducts[msg.sender].push(_productId);
        
        // Record transaction
        productHistory[_productId].push(Transaction({
            productId: _productId,
            actor: msg.sender,
            action: "Transportation Started",
            newPrice: product.currentPrice,
            details: _transportDetails,
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        
        totalTransactions++;
        
        emit ProductUpdated(_productId, msg.sender, "Transportation Started", product.currentPrice, "In Transit");
        emit SupplyChainStep(_productId, product.farmer, msg.sender, "Transportation", block.timestamp);
    }
    
    /**
     * @dev Update product as retailer (Retail phase)
     * @param _productId Product ID to update
     * @param _retailMargin Retail margin to add
     * @param _storeDetails Store details (address, storage conditions, etc.)
     */
    function updateAsRetailer(
        string memory _productId,
        uint256 _retailMargin,
        string memory _storeDetails
    ) public productExists(_productId) validStatus(_productId, "In Transit") {
        Product storage product = products[_productId];
        
        // Update product details
        product.retailer = msg.sender;
        product.currentPrice += _retailMargin;
        product.status = "Available for Consumers";
        
        // Add to retailer's products
        retailerProducts[msg.sender].push(_productId);
        
        // Record transaction
        productHistory[_productId].push(Transaction({
            productId: _productId,
            actor: msg.sender,
            action: "Added to Store",
            newPrice: product.currentPrice,
            details: _storeDetails,
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        
        totalTransactions++;
        
        emit ProductUpdated(_productId, msg.sender, "Added to Store", product.currentPrice, "Available for Consumers");
        emit SupplyChainStep(_productId, product.distributor, msg.sender, "Retail", block.timestamp);
    }
    
    /**
     * @dev Mark product as delivered to consumer
     * @param _productId Product ID to mark as delivered
     */
    function markAsDelivered(string memory _productId) 
        public 
        productExists(_productId) 
        validStatus(_productId, "Available for Consumers") 
    {
        Product storage product = products[_productId];
        product.status = "Delivered";
        
        // Record transaction
        productHistory[_productId].push(Transaction({
            productId: _productId,
            actor: msg.sender,
            action: "Delivered to Consumer",
            newPrice: product.currentPrice,
            details: "Product successfully delivered",
            timestamp: block.timestamp,
            blockNumber: block.number
        }));
        
        totalTransactions++;
        
        emit ProductUpdated(_productId, msg.sender, "Delivered", product.currentPrice, "Delivered");
        emit SupplyChainStep(_productId, product.retailer, msg.sender, "Delivery", block.timestamp);
    }
    
    // View functions for frontend integration
    
    /**
     * @dev Get complete product information
     */
    function getProduct(string memory _productId) 
        public 
        view 
        returns (Product memory) 
    {
        require(products[_productId].exists, "Product does not exist");
        return products[_productId];
    }
    
    /**
     * @dev Get complete transaction history for a product
     */
    function getProductHistory(string memory _productId) 
        public 
        view 
        returns (Transaction[] memory) 
    {
        return productHistory[_productId];
    }
    
    /**
     * @dev Get all product IDs
     */
    function getAllProductIds() public view returns (string[] memory) {
        return allProductIds;
    }
    
    /**
     * @dev Get products by farmer
     */
    function getProductsByFarmer(address _farmer) 
        public 
        view 
        returns (string[] memory) 
    {
        return farmerProducts[_farmer];
    }
    
    /**
     * @dev Get products by distributor
     */
    function getProductsByDistributor(address _distributor) 
        public 
        view 
        returns (string[] memory) 
    {
        return distributorProducts[_distributor];
    }
    
    /**
     * @dev Get products by retailer
     */
    function getProductsByRetailer(address _retailer) 
        public 
        view 
        returns (string[] memory) 
    {
        return retailerProducts[_retailer];
    }
    
    /**
     * @dev Verify product authenticity and get complete chain of custody
     */
    function verifyProduct(string memory _productId) 
        public 
        view 
        returns (
            bool verified,
            uint256 totalSteps,
            address[] memory actors,
            string[] memory actions,
            uint256[] memory timestamps
        ) 
    {
        require(products[_productId].exists, "Product does not exist");
        
        Transaction[] memory history = productHistory[_productId];
        uint256 length = history.length;
        
        actors = new address[](length);
        actions = new string[](length);
        timestamps = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            actors[i] = history[i].actor;
            actions[i] = history[i].action;
            timestamps[i] = history[i].timestamp;
        }
        
        return (true, length, actors, actions, timestamps);
    }
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() 
        public 
        view 
        returns (
            uint256 _totalProducts,
            uint256 _totalTransactions,
            uint256 _totalValue,
            uint256 _activeProducts
        ) 
    {
        uint256 totalValue = 0;
        uint256 activeProducts = 0;
        
        for (uint256 i = 0; i < allProductIds.length; i++) {
            Product memory product = products[allProductIds[i]];
            totalValue += product.currentPrice * product.quantity;
            
            if (keccak256(bytes(product.status)) != keccak256(bytes("Delivered"))) {
                activeProducts++;
            }
        }
        
        return (totalProducts, totalTransactions, totalValue, activeProducts);
    }
}


