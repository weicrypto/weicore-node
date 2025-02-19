# Scaffold
A collection of functions for creating, managing, starting, stopping and interacting with a Bitcore node.

## Install
This function will add a service to a node by installing the necessary dependencies and modifying the `bitcore-node-wei.json` configuration.

## Start
This function will load a configuration file `bitcore-node-wei.json` and instantiate and start a node based on the configuration.

## Find Config
This function will recursively find a configuration `bitcore-node-wei.json` file in parent directories and return the result.

## Default Config
This function will return a default configuration with the default services based on environment variables, and will default to using the standard `/home/user/.bitcoin` data directory.

## Uninstall
This function will remove a service from a node by uninstalling the necessary dependencies and modifying the `bitcore-node-wei.json` configuration.

## Call Method
This function will call an API method on a node via the JSON-RPC interface.
