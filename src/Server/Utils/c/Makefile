SOB = server
COB = client
CC = gcc
DEBUG = -g
CFLAGS = -Wall $(DEBUG)
EXE= server client


all : $(EXE)
	echo "Done making all executables"

client : $(COB).c
	$(CC) $(CFLAGS) $(COB).c -o $(COB)

server : $(SOB).c
	$(CC) $(CFLAGS) $(SOB).c -o $(SOB)
	
clean : 
	/bin/rm client server

tar:
	rm client;
	rm server;
	tar cvf clang_client_server.tar server.c client.c
	rm client.c;
	rm server.c;
