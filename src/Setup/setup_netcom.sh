#!/bin/bash

####################################################
#	1 - Ensure NodeJS / NPM has all necessary dependencies        #
####################################################
pushd $PWD;
cd ../Server;
echo 'We will make sure you have the npm packages'
sudo npm install -g

##################################
#	2 - Build C client and server code         #
##################################
echo 'Now building makefiles in the c/ folder.'
cd Utils/c/;
make;
echo 'Done building c client and server'

####################################################
#	Several more setup pieces will emerge TBD                               #
####################################################
