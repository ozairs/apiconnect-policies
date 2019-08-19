# Part 2 - Deploying User Defined Policies for DataPower Managed objects

In this section, you will deploy a UDP policy that depends on a DataPower managed objects. These objects are often referenced from GatewayScript / XSLT but can also include other API Assembly policies such as JWT Validate. 

Common examples of DataPower managed objects
- Load Balancer Group: invoke multiple endpoints load balanced across multiple servers - **Invoke policy**
- MQ Queue Manager: interact with an IBM MQ queue manager to process messages asynhcronously - **GatewayScript or XSLT Policy**
- SQL DataSource: interact with a database, such as DB2 to perform queries - **XSLT Policy**

TBD ...