/* A simple server in the internet domain using TCP
   The port number is passed as an argument */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>

void error(const char *msg)
{
    perror(msg);
    exit(1);
}

int main(int argc, char *argv[])
{
     int sockfd, newsockfd, portno;
     socklen_t clilen;
     char buffer[256];
     struct sockaddr_in serv_addr, cli_addr;
     int n;
     int state = 1;
     if (argc < 2) {
         fprintf(stderr,"ERROR, no port provided\n");
         exit(1);
     }
     sockfd = socket(AF_INET, SOCK_STREAM, 0);
     if (sockfd < 0)
        error("ERROR opening socket");
     bzero((char *) &serv_addr, sizeof(serv_addr));
     portno = atoi(argv[1]);
     serv_addr.sin_family = AF_INET;
     serv_addr.sin_addr.s_addr = INADDR_ANY;
     serv_addr.sin_port = htons(portno);
     if (bind(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0) { error("ERROR on binding");}      
     do {
         listen(sockfd,5);
         clilen = sizeof(cli_addr);
         newsockfd = accept(sockfd, (struct sockaddr *) &cli_addr, &clilen);
         
         if (newsockfd < 0){ error("ERROR on accept"); }

         bzero(buffer,256);
         n = read(newsockfd,buffer,255);
         if (n < 0) error("ERROR reading from socket");
         printf("Here is the message: %s\n",buffer);
         
         int exit_cmd = 0;  // if the server recieves a message with only '0'         
         state = 2; // evaluating         
         int msg_value = atoi(buffer);  // convert buffer into int
         
         printf("This was the value -> %d\n\n", msg_value);
         
         // Evaluate msg
         if( msg_value == exit_cmd)
         {
            n = write(newsockfd,"Closing server bro",18);
            if (n < 0) { error("ERROR writing to socket"); }            
            printf("\nClosing Connection!\n");
            close(newsockfd);
            close(sockfd);
            n = 0;
            state = 0;  // exiting
         }
         else
         {           
            n = write(newsockfd,"I got your message bro",22);
            if (n < 0) { error("ERROR writing to socket"); }
            printf("\nListening\n");
            state = 1;  // listening
         }
     }while(state!=0);

     return 0;
}
