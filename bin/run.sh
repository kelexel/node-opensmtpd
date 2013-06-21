#!/bin/sh

if [ ! -z $1 ] && [ $1 = "--shell" ]; then
	node ../lib/shell.js
else
	node ../lib/server.js
fi