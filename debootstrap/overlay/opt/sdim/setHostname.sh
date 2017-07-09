#!/bin/bash
if [ $# -eq 1 ]; then
        echo "Setting hostname to $1"
        echo "$1" > /etc/hostname
        echo "127.0.0.1 $1" > /etc/hosts
fi