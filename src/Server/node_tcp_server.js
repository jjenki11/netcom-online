// A combination client/server that can utilize each other's API

var SocketIOBridge = undefined;


// Our lookup table for message types is a HashMap with <Key, Value> pairs
var HT = require('./Utils/js/HashMap.js').HashMap();

HT.put(0, 'end_node_client');
HT.put(1, 'end_node_server');
HT.put(2, 'end_c_client');
HT.put(3, 'end_c_server');
console.log('hashmap exists?? ',HT.size());

// Evaluate message from client and handle appropriately
var EvaluateMessageInServer = function(data) {
    if(HT.get(parseInt(data)) !== undefined) {
        return HT.get(parseInt(data));
    } else {
        return "Message "+data+" Not in Hash Table.";
    }   
    return "n/a";
};

// Now we are going to do something interesting....
//      Make a client inside of the server that can be started and stopped dynamically.
var ClientNet = require('net');
var NodeClient = function(c) 
{    
    // Private member variables
    var TheClient = undefined;
    var net_req = undefined;    
    var self = {}; 
    
    // Stop the client
    self.Stop = function() {
        console.log('stopping client');
        if(! this.TheClient){
            this.TheClient.destroy();
        }
        this.TheClient = undefined;
    };
    
    // Start the client
    self.Start = function(HOST, PORT)
    {
        this.TheClient.connect(PORT, HOST, function() {
            console.log('Connected');   // share connectivity status
            if(this.TheClient !== undefined){
                this.TheClient.write('Hello, server! Love, Client (on port) -> '+PORT);   // write message back to server
            } else {
                console.log('this.TheClient is undefined still...');
            }
        });
    };
    
    // Create client
    self.Create = function(n)
    {
        this.net_req = n;
        this.TheClient = new this.net_req.Socket();
    };
    
    // Setup client
    self.Setup = function() 
    {
        this.TheClient.on('data', function(data) {
            console.log('Received: ' + data);   // log response data
            //this.TheClient.destroy(); // kill client after server's response
        });
        this.TheClient.on('close', function() {
            console.log('Connection closed');   // log status
            //this.TheClient.destroy();
            self.Stop();
        });
    };
    
    // Return reference to client object
    self.GetServer = function(){return this.TheClient;};
    
    // Emit message to server listening to the client
    self.Emit = function(data){
        if(this.TheClient == undefined){
            console.log('Client has died.');
        } else {
            this.TheClient.write(data);
        }
    };
        
    // api
    return self;
};

//  Create an arbitrary client talking on port 7091
var client_1 = new NodeClient();
client_1.Create(ClientNet);
client_1.Setup()
client_1.Start('127.0.0.1' , 7091);
console.log('started up NodeClient()...');

// NetJS npm api
var net = require('net'); 
 // This is how you define a server using NetJS api
var tcpServer = net.createServer(function (socket) {
  // Report that we are connected
  console.log('<-- server connected');
  // Catch the null byte '\0' and disconnect the server
  socket.on('end', function() {
      console.log('<-- server disconnected');
      
      //client_1.Stop();
      //socket.write("end_connection");
  });
  // Whenever any 'data' comes to the server
  socket.on('data', function(data) {
    // Log the message in the server
    console.log("From client recv "+ data.toString());
    var res = (EvaluateMessageInServer(data.toString()));
    console.log("The message type corresponds to -> "+res);
    if(parseInt(data.toString()) == 0)
    {
        // this means we should exit.
        console.log('stopping SIO bridge');
        client_1.Emit('0');        
        SocketIOBridge.Stop();
       
    }
    else 
    {
        // Write message from server back to client
        
        socket.write("Your last data object was -> "+res + " with index -> "+parseInt(data.toString()));    
        client_1.Emit((data.toString()));    
        //client_1.Stop();
    }

  });
  
  // In the event that the connection has a problem
  socket.on('error', function(err){
    // Log the error
    console.log("Error on TCP", err);
  });
}); 
 // Only need to have a single 'listen' command for tcp server
tcpServer.listen(7090);

// Now we stand up the socket.io server; 
//      the 'easy bridge' between front-end (webpage) client socket.io connection 
//      and our back-end server/client scheme

// Socket.io server logic 
//    - TBD hook up this socket to our client side socket.io communication module
var SocketIOServer = function() 
{
    var self = {};
    var io = undefined;
    var SIO_NAMESPACE = undefined;
    var hv = undefined;
    var pub_socket = undefined;
    //  Create the socket
    self.Create = function(server) {
        this.io = require('socket.io').listen(server, {
            'log level': 0,
            'close timeout': 1,
            'secure': false
        });
        this.SIO_NAMESPACE = "/hv";
    };
    self.Stop = function() {
        this.hv = null;
        console.log('socket.io server has been stopped.');
    }
    //  Start the socket
    self.Start = function() {
        this.hv = this.io
                    .of(this.SIO_NAMESPACE)
              .on('connection',
        function(theSocket) 
        {
            var socket = theSocket;
            function send(data){
                data.from = 'hv';
                data.timestamp = new Date();
                socket.emit('chat_message', data);
            }            
            socket.on('msg_1', function(data) {
                console.log('handling msg 1...');
            });
            socket.on('msg_2', function(data) {
                console.log('handling msg 2...');
            });
            socket.on('msg_3', function(data) {
                console.log('handling msg 3...');
            });
            socket.on('0', function(data) {
                console.log('Well, socketio handler just got \'0\'!');
            });
            this.pub_socket = socket;
        });
    };
    //  Get a reference to the socket object
    self.GetSocket = function() {
        return this.pub_socket;
    };
    // api        
    return self;
};

SocketIOBridge = new SocketIOServer();
SocketIOBridge.Create(tcpServer);
console.log('Creating socket.io mpi server...');
SocketIOBridge.Start();

