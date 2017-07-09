#!/bin/bash

# This script is used to create a complete RaspberryPi Image using debootstrap.
# The Image will contain all the needed parts to run the SDIM-Projekt (Secure and Decentralized Instant Messaging).
#
# IMPORTANT: PLEASE RUN THIS SCRIPT AS ROOT USER OR WITH SUDO!
# 		Needed for debootstrap and qemu
# 
# Requirements:
#	- qemu-user-static
#	- debootstrap
#	- git
#	- kpartx
#
#	- Raspberry Pi 2 or 3
#
# Exit Codes:
#	1 - Script not run as root user
#	2 - Package is missing
#
# Sources for information:
#	https://raspberry.tips/raspberrypi-tutorials/eigenes-raspbian-image-fuer-den-raspberry-pi-erstellen/
#	


BUILDENV=$(dirname "$0")
BUILDENV=$(cd "$BUILDENV" && pwd )
BUILDPATH="${BUILDENV}/chroot-sdim-armhf"
BUILDVERSION="jessie"
OVERLAYPATH="${BUILDENV}/overlay"

IMAGENAME="${BUILDENV}/sdim_rootfs.img"
MIRROR="http://archive.raspbian.org/raspbian"
ARCH="armhf"


######################################################
# PREREQS
######################################################

# Check for the user who started the script
if [ "$(whoami)" != "root" ]; then
	echo "[Error] Please run this script as root user!"
	exit 1
fi

# Check for the basic toolkit which is needed to create the Raspi Image
# Get Distribution	
DISTRIBUTION=$(lsb_release -i | awk '{print $3}')
if [ "${DISTRIBUTION}" == "Ubuntu" ] || [ "${DISTRIBUTION}" == "Debian" ]; then
	# Check for all packages listed using dpkg-query		
	for i in qemu-user-static debootstrap git kpartx; do
		result=$(dpkg-query -W -f='${binary:Package}\n' $i 2>/dev/null | wc -l )
		if [ ${result} -lt 1 ]; then
			# Print a warning and exit the script if a package is missing
			echo "[Error] Package ${i} is missing. Please install it and start this script again!"
			exit 2
		fi
	done
else
	# Only Support for Debian/Ubuntu for now. Please check for the packages yourself
	echo "[Warning] Cannot check for needed packages because you are not using Ubuntu or Debian as Distribution..."
fi

# Creating overlay directory
mkdir ${OVERLAYPATH} > /dev/null 2>&1

######################################################
# STAGE 0 - CLEANUP
######################################################

# Cleanup existing builds
echo -e "\n+++++ CLEANING UP OF EXISTING BUILD +++++"
fuser -k ${BUILDPATH}
kpartx -d ${IMAGENAME} > /dev/null 2>&1

umount ${BUILDPATH}/boot
umount ${BUILDPATH}
echo -e "\t Removing buildpath, old Image and other artifacts"
rm -rf "${BUILDPATH}" > /dev/null 2>&1

LOOPDEV=$(losetup -l -O NAME,BACK-FILE | grep ${IMAGENAME} | awk '/dev/ {print $1}')
if [ "${LOOPDEV}" != "" ]; then
	for i in $(lsblk -l -p ${LOOPDEV} -o NAME,TYPE | awk '/part/ {print $1}'); do
		dmsetup remove ${i}
	done
	losetup -d ${LOOPDEV}
	kpartx -d ${IMAGENAME}
fi
rm ${IMAGENAME} > /dev/null 2>&1
rm -rf ./rpi-update > /dev/null 2>&1

######################################################
# STAGE 1 - IMAGE CREATION
######################################################

echo -e "\n+++++ CREATING IMAGE AND PARTITONS +++++" 
# Create empty imagefile
dd if=/dev/zero of="${IMAGENAME}" bs=1M count=1524
LOOPDEVICE=$(losetup -f --show "${IMAGENAME}")

# Create partition table using fdisk
fdisk ${LOOPDEVICE} > /dev/null 2>&1 << EOF
n
p
1

+64M
t
c
n
p
2


w
EOF

# Unmount loop device and reread partition table
losetup -d ${LOOPDEVICE}

BOOTPARTITION="$(kpartx -va "${IMAGENAME}" | awk '{print $3}' | head -1)"
ROOTPARTITION="$(kpartx -va "${IMAGENAME}" | awk '{print $3}' | tail -1)"
sleep 2

# Make filesystems on our partitions
mkfs.vfat "/dev/mapper/${BOOTPARTITION}"
mkfs.ext4 -F "/dev/mapper/${ROOTPARTITION}"

# Mount the created filesystems, copy data and unmount the partition
echo -e "\n+++++ MOUNTING THE CREATED PARTITIONS FOR DEBOOTSTRAP +++++" 
mkdir ${BUILDPATH}
mount "/dev/mapper/${ROOTPARTITION}" ${BUILDPATH}
mkdir ${BUILDPATH}/boot
mount "/dev/mapper/${BOOTPARTITION}" ${BUILDPATH}/boot

######################################################
# STAGE 2 - RUN DEBOOTSTRAP
######################################################

# Start the installation of the debootstrap environment. This can take some time (download packages, ...)
echo -e "\n+++++ RUNNING DEBOOTSTRAP - STAGE 1 +++++" 
debootstrap --no-check-gpg --foreign --arch=armhf --variant=minbase ${BUILDVERSION} ${BUILDPATH} ${MIRROR}
cp /usr/bin/qemu-arm-static ${BUILDPATH}/usr/bin/

echo -e "\n+++++ RUNNING DEBOOTSTRAP - STAGE 2 +++++" 
LANG=C chroot ${BUILDPATH} /debootstrap/debootstrap --second-stage

#####################################################
# STAGE 3 - CONFIGURATION
######################################################

echo -e "\n+++++ CONFIGURING IMAGE +++++"
wget -O ${OVERLAYPATH}/apt_key1.key http://archive.raspbian.org/raspbian.public.key
wget -O ${OVERLAYPATH}/apt_key2.key http://archive.raspberrypi.org/debian/raspberrypi.gpg.key
rsync -rtv ${OVERLAYPATH}/ ${BUILDPATH}/

# Create Script for commands that need to be executed inside the Image
echo -e "\n+++++ CREATING SCRIPT TO RUN INSIDE DEBOOTSTRAP +++++" 
chmod a+x "${BUILDPATH}/install.sh"

######################################################
# STAGE 4 - RUN FINISH STEPS
######################################################

# Run last setup script inside the image using chroot 
echo -e "\n+++++ RUNNING SCRIPT INSIDE THE IMAGE WITH CHROOT +++++"
LANG=C chroot ${BUILDPATH} /install.sh
rm ${BUILDPATH}/install.sh

######################################################
# STAGE  - CREATE BOOT PARTITION AND FINISH
######################################################

# Run rpi-update to create boot content
echo -e "\n+++++ CREATING BOOT PARTITION CONTENT +++++"
curl -o ./rpi-update https://raw.githubusercontent.com/Hexxeh/rpi-update/master/rpi-update
chmod +x ./rpi-update
touch ${BUILDPATH}/boot/start.elf
ROOT_PATH=${BUILDPATH} BOOT_PATH=${BUILDPATH}/boot ./rpi-update
rm ./rpi-update > /dev/null 2>&1

# Unmount all Directories and remove partition table from the host
echo -e "\n+++++ UNMOUNT THE FILESYSTEMS AND REMOVE THE PARTITION TABLE FROM THE SYSTEM +++++"
fuser -k ${BUILDPATH}
umount ${BUILDPATH}/boot
umount ${BUILDPATH} && rm -r ${BUILDPATH}
kpartx -d "${IMAGENAME}" >/dev/null 2>&1 

echo -e "\n+++++ DONE ! +++++" 
echo -e "+++++ YOU CAN COPY THE IMAGE TO YOUR SD-CARD +++++"
