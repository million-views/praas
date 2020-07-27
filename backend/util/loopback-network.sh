#!/usr/bin/env bash
# ============================================================================ #
#        Author : Shine Nelson <shine@m5nv.com>
#  Organization : Million Views LLC
#       Created : 2020-07-27
#       Comment : This script adds pre-defined IP addresses to the loopback
#                 interface to enable testing of allow lists feature
# ============================================================================ #

# Set POSIX compatibility
set -o posix

# Exit immediately if a command exits with a non-zero status.
set -o errexit

# Enable command trace if DEBUG=true
[ -n "${DEBUG}" ] && set -o xtrace

# Set script base directory
script_dir=$( dirname $0 )

# Validate number of arguments
# and set `action` to the argument
if [ $# -ne 1 ]; then
	echo 'this script accepts a single binary argument : `add` | `del`'
	exit 1
elif [ $1 != 'add' ] && [ $1 != 'del' ]; then
	echo 'unrecognized argument'
	exit 1
else
	action=$1
fi


function set_command {
	if command -v ip > /dev/null; then
		command=ip
		command_path=$( command -v ip )
	elif command -v ifconfig > /dev/null; then
		command=ifconfig
		command_path=$( command -v ifconfig )
	else
		echo 'no command found to parse network interfaces'
	fi
}

function parse_ip_list {
	ips_file="${script_dir}/../lib/fake-ips.js"
	if [ -f ${ips_file} ]; then
		ip_list=( $( \
			awk -F '[][]' '{ print $2 }' ${ips_file} | \
			sed -e 's/"//g' -e 's/,//g' ) \
			)
		# conform IP list to CIDR notation
		if [ "${command}" == "ip" ]; then
			for index in ${!ip_list[@]}; do
				ip_list[${index}]="${ip_list[$index]}/32"
			done
		fi
	else
		echo 'file with IP addresses not found'
		exit 1
	fi
}

function fetch_loopback_interface {
	if [ "${command}" == "ip" ]; then
		interface=$( \
			${command_path} link show | \
			grep 'LOOPBACK' | \
			awk -F : '{ print $2 }' | \
			sed -e 's/ //g'
		)
	elif [ "${command}" == "ifconfig" ]; then
		interface=$( \
			${command_path} | \
			grep 'LOOPBACK' | \
			awk -F : '$2 ~ "flags*" { print $1 }' | \
			sed -e 's/ //g'
		)
	else
		echo 'function called without command to be run'
		exit 1
	fi
}

function add {
	if [ "${command}" == "ip" ]; then
		for ip in ${ip_list[@]}; do
			sudo ${command_path} address add ${ip} dev ${interface}
		done
	elif [ "${command}" == "ifconfig" ]; then
		for ip in ${ip_list[@]}; do
			sudo ${command_path} ${interface} add ${ip}
		done
	else
		echo 'function called without command to be run'
		exit 1
	fi
}

function del {
	if [ "${command}" == "ip" ]; then
		for ip in ${ip_list[@]}; do
			sudo ${command_path} address del ${ip} dev ${interface}
		done
	elif [ "${command}" == "ifconfig" ]; then
		for ip in ${ip_list[@]}; do
			sudo ${command_path} ${interface} del ${ip}
		done
	else
		echo 'function called without command to be run'
		exit 1
	fi
}

# main execution stack
set_command
parse_ip_list
fetch_loopback_interface
echo 'since this script changes system settings, it requires `sudo` to run'
[ -n "${action}" ] && ${action}
echo "${interface} : successfully ${action}ed ${#ip_list[@]} IPs"
