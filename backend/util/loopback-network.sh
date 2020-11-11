#!/usr/bin/env bash
# ============================================================================ #
#       Comment : This script adds pre-defined pseduo-random IP addresses to
#                 the loopback interface to enable testing of allow lists
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
elif [[ $1 == "del" ]] && [[ "${OSTYPE}" =~ "darwin" ]]; then
	action='delete'
else
	action=$1
fi

# on mac there is a dumbed down version of iconfig under /usr/local/bin
# that does jack for us; this script works only with either 'ip' or
# '/sbin/ifconfig' commands. Also, note that 'ifconfig' on debian is
# not in the PATH... 
#
# tested on Debian and Mac
function set_command {
	if command -v ip > /dev/null; then
		command=ip
		command_path=$( command -v ip )
	elif command -v '/sbin/ifconfig' > /dev/null; then
		command=ifconfig
		command_path=$( command -v /sbin/ifconfig )
	elif command -v netsh > /dev/null; then
		command=netsh
		command_path=$( command -v netsh )
	else
		echo 'no compatible command found to parse network interfaces'
	fi
}

function parse_ip_list {
	if ! command -v node > /dev/null; then
		echo 'node is required to run this script'
		exit 1
	fi

	ips_file="${script_dir}/../lib/fake-ips.js"
	if [ -f ${ips_file} ]; then
		ip_list=( $( \
			node ${ips_file} | tr -d ':' | cut -d' ' -f2- | tr -s ',' ' '
		));

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
	elif [ "${command}" == "netsh" ]; then
		interface=$( \
			${command_path} interface ipv4 show interfaces | \
			grep -i 'loopback pseudo' | \
			tr -s ' ' | \
			cut -d' ' -f6-
		)
	else
		echo 'function called without command to be run'
		exit 1
	fi
}

function action {
	if [ "${command}" == "ip" ]; then
		for ip in ${ip_list[@]}; do
			sudo ${command_path} address ${action} ${ip} dev ${interface}
		done
	elif [ "${command}" == "ifconfig" ]; then
		for ip in ${ip_list[@]}; do
			sudo ${command_path} ${interface} ${action} ${ip}
		done
	elif [ "${command}" == "netsh" ]; then
		for ip in ${ip_list[@]}; do
			sudo ${command_path} interface ipv4 ${action} address \"${interface}\" ${ip}
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
[ -n "${action}" ] && action
echo "${interface} : successfully ${action}ed ${#ip_list[@]} IPs"
