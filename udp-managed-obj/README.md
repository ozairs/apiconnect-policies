# Deploying User Defined Policies for DataPower Managed objects

In this section, you will deploy a User Defined policy that requires a DataPower managed objects. These objects are usually referenced from GatewayScript / XSLT but can also include other API Assembly policies such as JWT Validate. 

Common examples of DataPower managed objects
- MQ Queue Manager: interact with an IBM MQ queue manager to process messages asynhcronously - **GatewayScript or XSLT Policy**
- SQL DataSource: interact with a database, such as DB2 to perform queries - **XSLT Policy**
- JWT Validate: uses a DataPower crypto object

In this tutorial, you will expand on the previous tutorial to create a UDP that uses a DataPower configuration object.

**Table of Contents**

<!-- TOC -->
 - [1.1. Perform Audit Logging with IBM MQ](#11-perform-audit-logging-with-ibm-mq)auto    
 - [1.2. Enrich Messages using IBM DB2 on IBM Cloud](#12-enrich-messages-using-ibm-db2-on-ibm-cloud)
 - [1.3. Summary](#13-summary)

## 1.1. Perform Audit Logging with IBM MQ

In this section, you will build a UDP that logs messages to IBM MQ on IBM Cloud. This use case is very common when you have regulatory / security requirement to record API requests and/or responses. The payload is simply put on a queue (ie fire/forget) and only a simple acknowledge is needed for success. For details on configuring DataPower with IBM MQ on IBM Cloud, see [here](). The next steps assume you have configured the DataPower MQ queue manager object to connect with IBM MQ on Cloud.

1. Expand the `mq` directory, you will notice the following files
 - mq-invoke-policy.cfg
 - mq-invoke.js
 - mq-queue-manager.cfg

2. Open the `invoke-mq-policy.cfg` file. This configuration file is similar to the UDP template that is used in the `udp-basic` folder in this repository. If you want to change the object names or add new parameters, you can modify this file.

3. Open the `invoke-mq.js` file. This file contains a single parameter of the queue manager name. This name must be the exact value of the `MQ Queue Manager object` defined within DataPower. You will examine this configuration in the next step. The key code is the following:
    ```
    var options = { target: 'dpmq://' + param1 + '/?',
    requestQueue: param2,
    //replyQueue: '',
    //headers: mqHeader
    transactional: false,
    sync: false,
    timeOut: 10000,
    data: context.get("message.body") };

    url.open (options, function (err, resp)

    ```

    The `options` variable contains the parameters for the MQ queue manager and the queue name.

4. The MQ queue manager object configuration is contained within the file `mq-invoke-queue-manager.cfg`. Examine the file and modify the following values:
 - Hostname: api-qm-7ef7.qm.us-south.mq.appdomain.cloud
 - Listener port: 30662
 - Application channel name: CLOUD.APP.SVRCONN
 - Username
 - Password

 This information can be downloaded from the IBM MQ service, for more details see [here]().

5. Package the MQ Invoke policy into a ZIP file. If you have other UDPs then you can include them in the command too. You can only deploy a single Gateway extension per Gateway cluster.
    ```
    zip gw-extension.zip udp-managed-obj/mq/*.cfg udp-managed-obj/mq/*.js
    ```
6. Login to API manager using the `apic` cli
    ```
    apic login --server 127.0.0.1:2000 --username admin --password 7iron-hide --realm admin/default-idp-1
    ```
7. Upload extension using the `apic` command-line tool
    ```
    apic gateway-extensions:create gw-extension.zip --scope org --org admin --gateway-service datapower-api-gateway --availability-zone availability-zone-default --server 127.0.0.1:2000
    
    gateway-extension   https://127.0.0.1:2000/api/orgs/53463679-3f9f-44d3-8c98-0ae242757eb1/availability-zones/09b41905-d076-425f-81a1-060369e125a0/gateway-services/ee46f2eb-3560-48af-a403-38fd804e183c/gateway-extension   
    ```
8.  Confirm extension has been added
    ```
    apic gateway-extensions:get --scope org -o admin --gateway-service datapower-api-gateway --availability-zone availability-zone-default --server 127.0.0.1:2000 --output -

    type: gateway_extension
    api_version: 2.0.0
    name: gateway-extension
    gateway_service_url: >-
    https://127.0.0.1:2000/api/orgs/53463679-3f9f-44d3-8c98-0ae242757eb1/availability-zones/09b41905-d076-425f-81a1-060369e125a0/gateway-services/ee46f2eb-3560-48af-a403-38fd804e183c
    scope: org
    created_at: '2019-08-13T22:01:11.538Z'
    updated_at: '2019-08-13T22:01:11.538Z'
    org_url: 'https://127.0.0.1:2000/api/orgs/53463679-3f9f-44d3-8c98-0ae242757eb1'
    url: >-
    https://127.0.0.1:2000/api/orgs/53463679-3f9f-44d3-8c98-0ae242757eb1/availability-zones/09b41905-d076-425f-81a1-060369e125a0/gateway-services/ee46f2eb-3560-48af-a403-38fd804e183c/gateway-extension
    ```
    
    **Important**: If you need to re-deploy then delete the gateway extension with the following command:
    ```
    apic gateway-extensions:delete --scope org --org admin --gateway-service datapower-api-gateway --availability-zone availability-zone-default --server 127.0.0.1:2000
    ```
9. Manually deploy the UDP policy using the DataPower UI at `https://127.0.0.1:9091` 
    - Username `admin` 
    - Password `admin`. 
    - Graphical UI drop-down: `Web GUI`
    - Domain: apiconnect

10. Trigger the API Manager to push the Gateway extension to the Gateway. Restart the API Connect Gateway service, modify the **Administrate State** to **disabled** and click **Apply**. Change the state back to **Enabled** and click **Apply**.

11. You may need to wait a minute for the Gateway Extension to copy over, when you refresh the screen, scroll down to the User-defined Policy, select the `UDP Basic` policy in the drop-down and click **add**.  Click **Apply** to save the configuration.

12. Switch to the API Designer and click the existing **sports-api-1.0.0** API. Click the **Assemble** tab. You should see the `MQ Invoke` policy
    ![alt](_images/UDP_MQInvoke.jpg)

11. Drag and drop the **MQ Invoke** policy into the Assembly. Click the Policy and enter the MQ queue manager object name (eg `ibm_cloud_qm`) and request queue (eg `DEV.QUEUE.1`). Save the policy.

12. Republish the API - in the top right-hand corner beside **Running**, click the Play icon or the wheel icon to republish the API. 

13. Send a request to the API, you should get a successful response. Switch to the IBM MQ Web console and verify that the message was successfully placed onto the queue.

## 1.2. Enrich Messages using IBM DB2 on IBM Cloud

In this section, you will build a UDP that connects to an external database service (IBM DB2 on Cloud) to retrieve data that enriches the response. The DataPower Gateway can interact with databases and perform SQL queries, the recommended use case is to perform read-only queries and avoid modifying the state of the database, since Gateways are optimized to process read-only requests quickly.

1. Expand the `database` directory, you will notice the following files
 - db2-invoke-policy.cfg
 - db2-invoke-sql-datasource.cfg
 - db2-invoke.xsl
 
2. Open the `db2-invoke-policy.cfg` file. This configuration file is similar to the UDP template that is used in the `udp-basic` folder in this repository. If you want to change the object names or add new parameters, you can modify this file.

3. Open the `db2-invoke.xsl` file. This file contains a single parameter of the SQL datasource name. This name must be the exact value of the `SQL Datasource` object defined within DataPower. You will examine this configuration in the next step. The key code is the following:
    ```
    <xsl:variable name="result" select="dp:sql-execute($sql-datasource, $query)" />
    ```

    The `query` variable contains the SQL query performed on the database. 

    The policy only includes a single parameter, which is the name of the SQL datasource. If you have additional parameters, you can modify the XSL files, following the conventions in the comments.

4. The SQL Datasource object configuration is contained within the file `db2-invoke-sql-datasource.cfg`. Examine the file and modify the following values (search for `REPLACE_ME`):
 - password-encrypted (base64 encode the password): <password>
 - id: <db>
 - host: <host>
 - username: <username>
 - port (leave default): 50000

 This information can be downloaded from the IBM DB2 service, for more details see [here]().

5. Package the DB2 Invoke policy into a ZIP file. If you have other UDPs then you can include them in the command too. You can only deploy a single Gateway extension per Gateway cluster.
    ```
    zip gw-extension.zip udp-managed-obj/database/*.cfg udp-managed-obj/database/*.xsl
    ```
6. Login to API manager using the `apic` cli
    ```
    apic login --server 127.0.0.1:2000 --username admin --password 7iron-hide --realm admin/default-idp-1
    ```
7. Upload extension using the `apic` command-line tool
    ```
    apic gateway-extensions:create gw-extension.zip --scope org --org admin --gateway-service datapower-api-gateway --availability-zone availability-zone-default --server 127.0.0.1:2000
    
    gateway-extension   https://127.0.0.1:2000/api/orgs/53463679-3f9f-44d3-8c98-0ae242757eb1/availability-zones/09b41905-d076-425f-81a1-060369e125a0/gateway-services/ee46f2eb-3560-48af-a403-38fd804e183c/gateway-extension   
    ```
8.  Confirm extension has been added
    ```
    apic gateway-extensions:get --scope org -o admin --gateway-service datapower-api-gateway --availability-zone availability-zone-default --server 127.0.0.1:2000 --output -

    type: gateway_extension
    api_version: 2.0.0
    name: gateway-extension
    gateway_service_url: >-
    https://127.0.0.1:2000/api/orgs/53463679-3f9f-44d3-8c98-0ae242757eb1/availability-zones/09b41905-d076-425f-81a1-060369e125a0/gateway-services/ee46f2eb-3560-48af-a403-38fd804e183c
    scope: org
    created_at: '2019-08-13T22:01:11.538Z'
    updated_at: '2019-08-13T22:01:11.538Z'
    org_url: 'https://127.0.0.1:2000/api/orgs/53463679-3f9f-44d3-8c98-0ae242757eb1'
    url: >-
    https://127.0.0.1:2000/api/orgs/53463679-3f9f-44d3-8c98-0ae242757eb1/availability-zones/09b41905-d076-425f-81a1-060369e125a0/gateway-services/ee46f2eb-3560-48af-a403-38fd804e183c/gateway-extension
    ```
    
    **Important**: If you need to re-deploy then delete the gateway extension with the following command:
    ```
    apic gateway-extensions:delete --scope org --org admin --gateway-service datapower-api-gateway --availability-zone availability-zone-default --server 127.0.0.1:2000
    ```
9. Manually deploy the UDP policy using the DataPower UI at `https://127.0.0.1:9091` 
    - Username `admin` 
    - Password `admin`. 
    - Graphical UI drop-down: `Web GUI`
    - Domain: apiconnect

10. Trigger the API Manager to push the Gateway extension to the Gateway. Restart the API Connect Gateway service, modify the **Administrate State** to **disabled** and click **Apply**. Change the state back to **Enabled** and click **Apply**.

11. You may need to wait a minute for the Gateway Extension to copy over, when you refresh the screen, scroll down to the User-defined Policy, select the `DB2 Invoke` policy in the drop-down and click **add**.  Click **Apply** to save the configuration.

12. Switch to the API Designer and click the existing **sports-api-1.0.0** API. Click the **Assemble** tab. You should see the `DB2 Basic` policy
    ![alt](_images/UDP_DB2Basic.jpg)

11. Drag and drop the **DB2 Invoke** policy into the Assembly. Save the policy.

12. Republish the API - in the top right-hand corner beside **Running**, click the Play icon or the wheel icon to republish the API. 

13. Send a request to the API, you should get a successful response. 

## 1.3. Summary
