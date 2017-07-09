#!/bin/bash
chmod 777 /sys/class/gpio/export

for i in 4 17 24 22 23 18; do
	echo "$i" > /sys/class/gpio/export
done > /dev/null 2>&1

chmod 777 /sys/class/gpio/*/direction
chmod 777 /sys/class/gpio/*/value

