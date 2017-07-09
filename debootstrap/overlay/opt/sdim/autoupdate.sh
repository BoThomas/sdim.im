#!/bin/bash
apt-get update
apt-get -y --force-yes upgrade -o Dpkg::Options::="--force-confold"