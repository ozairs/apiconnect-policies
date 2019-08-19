# Part 1 - Deploying User Defined Policies using API Connect

**Pre-Requisites**
- API Connect Local Test Environment (LTE)

## Installing API Connect Local Test Environment (LTE)

Make sure you have downloaded the following files from IBM Fix Central
- IBM LTE (eg apic-lte-2018.4.1-15)
- API Designer & CLI (eg toolkit-loopback-designer-mac_lts_v2018.4.1.6-ifix3.0)

Note: The above file names will likely change during each new release

1. Install the API Connect LTE based on the instructions [here](https://www.ibm.com/support/knowledgecenter/SSMNED_2018/com.ibm.apic.toolkit.doc/rapic_lte_api_test.html)

    ```
    docker login 
    username: *******
    password: *******
    Authenticating with existing credentials...
    Login Succeeded

    apic-lte init
    ```

    Note: If you get errors during the install, you may need to stop and remove existing containers.
    ```
    docker ps
    CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                         NAMES
    a08ab4829f23        cassandra:3.11      "docker-entrypoint.s…"   6 minutes ago       Up 6 minutes        7000-7001/tcp, 7199/tcp, 9042/tcp, 9160/tcp   apic-lte-db
    $ docker stop a08ab4829f23
    a08ab4829f23
    $ docker rm a08ab4829f23
    a08ab4829f23
    ```

2. Start the API Connect LTE using the `apic-lte start` command

    ```
    $ apic-lte start
    INFO[0001] Creating docker resources                    
    INFO[0016] Waiting for services to start                
    INFO[0231] Configuring backend                          
    - Platform API url: https://localhost:2000
    - Admin user: username=admin, password=7iron-hide
    - 'localtest' org owner: username=shavon, password=7iron-hide
    - 'localtest' org sandbox test app credentials client id: 36e2da0e888ffcb6a9160200e40c5a15 , client secret: 3f4b5e8e835c4d21030a8b6436923fe8
    - Datapower API Gateway API base url: https://localhost:9444/localtest/sandbox/
    INFO[0264] Ready. The current version of the Local Test Environment is a beta release. See documentation at http://ibm.biz/localtest 
    ```
Note: If you stop the LTE (ie `apic-lte stop`), it will destroy all your containers and you will need to re-deploy your APIs. Furthermoore, the sample org sandbox test app credentials will also change, so you will need to use the new value when testing. You can use `apic-lte status` to view information about your environment.

## Deploy API using API Connect LTE

In this section, you will use the API Designer to deploy a set of APIs and gain familiarity with the local development environment.

1. Open the API Designer and navigate to the `openapi` folder. 
2. In the Connect to Cloud page, enter the URL `https://127.0.0.1:2000`. This endpoint is the API Manager (smaller version running locally), and the same as the Platform API url that is displayed once you start the LTE.
3. Login to the API manager using the credentials `shavon` and password `7iron-hide`.
4. Click on **Develop APIs and Products** and select `sports-api-1.0.0`.
5. Click the **Assemble** tab at the top.
    ![alt](_images/AssembleTab.jpg_)
6. Publishing APIs using LTE does not require you to explicitly define a product. You can quickly tests APIs using the default subscription which implicitly creates an API product. In the top right-hand corner, select the Play icon to publish the Sports API.
    ![alt](_images/AssemblePlay.jpg_)
7. Once the API is published, you can easily test it using any tool. For simplicity, you can use the following curl command
    ```
    curl -X GET \
  'https://localhost:9444/localtest/sandbox/sports/teams?league=nba' \
  -H 'x-ibm-client-id: 36e2da0e888ffcb6a9160200e40c5a15' \
  -H 'x-ibm-client-secret: 3f4b5e8e835c4d21030a8b6436923fe8'
    ```

## Creating User Defined Policies (UDP)

The basic UDP allows you to package one or more API assemblies into a single policy for reusability. For example, if you have a common logging policy that consists of multiple policies such as GatewayScript.

1. Expand the `udp-basic` directory, you will notice two files:
 - udp-basic-policy.cfg
 - udp-basic-gws.js

2. Open the `udp-basic-policy.cfg` file. You will notice that it consists of DataPower CLI commands. You don't need to memorize each command, but if you stick to the basics, you can make modifications based on your requirement.

    This example is the `Set Variable` policy which creates a set of context variables that are used in the API Assembly. The value `$(local.parameter.credential)` is a special variable that is obtained from user input into the UDP policy. This is similar to any API assembly policy that asks for input (ie Public Key to validate a JSON Web Token), so this paramater should reflect a user input field that is dynamically handled at runtime.

    ```
    assembly-setvar udp-basic_1.0.0_set-variable_0
        reset
        title "set-variable"
        correlation-path "$.x-ibm-configuration.assembly.execute[0]"
        variable
            action set
            name "param1"
            type string
            value "$(local.parameter.credential)"
        exit
        variable
            action set
            name "message.headers.content-type"
            type string
            value "text/xml"
        exit
    exit
    ```

    These commands should not be modified except when your creating a new policy, where you would replace `udp-basic` with your policy name. Also note the `gatewayscript-location` path, the important is the filename at the end. 
    
    It is important to keep the names the same since it will help in referencing files and avoiding collisions between UDP policies.
    ```
    assembly-gatewayscript udp-basic_1.0.0_gatewayscript_1
        reset
        title "gatewayscript"
        correlation-path "$.x-ibm-configuration.assembly.execute[1]"
        gatewayscript-location local:///filestores/extensions/gateway-extension/udp-basic/udp-basic-gws.js
    exit

    api-rule udp-basic_1.0.0_main
        reset
        action udp-basic_1.0.0_set-variable_0
        action udp-basic_1.0.0_gatewayscript_1
    exit

    assembly udp-basic_1.0.0
        reset
        rule udp-basic_1.0.0_main
    exit
    ```

    This last snippet create the UDP policy, including the information that is displayed in the UI. Remember that the parameter name `credential` needs to match the last part of the variable used in the Set Variable policy ie (`$(local.parameter.credential)` )
    ```
    assembly-function "udp-basic_1.0.0"
        summary "udp-basic-policy_1.0.0"
        title "Basic UDP"
        parameter
            name "credential"
            description "Parameter name"
            value-type string
        exit
        assembly udp-basic_1.0.0
    exit
    ```

    Optionally, you can deploy the UDP policy with the following snippet or manually add them to the DataPower configuration.

    ```
    apic-gw-service
        user-defined-policies udp-basic_1.0.0
    exit
    ```

    2. Open the `udp-basic-gws.js` file and examine its content. The same code shows how to access the context variable from the `Set-Variable` policy. The Javascript code simply creates a new JSON object with the contents of the parameter and the result of the Invoke policy.

# Packaging and Publishing UDP using Gateway Extensions

In this section, you will package the UDP policy into a Gateway extension and deploy it to the DataPower Gateway. The API Manager includes a CLI which provides the ability perform managed deployments into the gateway cluster.

- A single Gateway extension is deployed to a Gateway cluster. Artifacts are packaged into a ZIP file containing .cfg files, together with any dependent files that are referenced from the CFG file. 
- All files must be at the root of the ZIP file. The CFG files are processed in alphanumeric order by file name.
- ZIP files are uploaded to the file system: `local:///filestores/extensions/gateway-extension/` so any file references must be adjusted accordingly.

1. ZIP the file so that no folders are packaged into the ZIP file. Make sure your in the root directory when you perform the command.
    ```
    $ ls
    README.md               global-policy           udp-aaa                 udp-gws
    _images                 gw-extension.zip        udp-basic

    zip gw-extension.zip udp-basic/*.cfg udp-basic/*.js udp-basic/*.xsl
    ```

    Optionally, you can create a script file that includes the zip command as you add more references in future tutorials.

2. Login to API manager using the `apic` cli
    ```
    apic login --server 127.0.0.1:2000 --username admin --password 7iron-hide --realm admin/default-idp-1
    ```
3. Upload extension using the `apic` command-line tool
    ```
    apic gateway-extensions:create gw-extension.zip --scope org --org admin --gateway-service datapower-api-gateway --availability-zone availability-zone-default --server 127.0.0.1:2000
    
    gateway-extension   https://127.0.0.1:2000/api/orgs/53463679-3f9f-44d3-8c98-0ae242757eb1/availability-zones/09b41905-d076-425f-81a1-060369e125a0/gateway-services/ee46f2eb-3560-48af-a403-38fd804e183c/gateway-extension   
    ```
4.  confirm extension has been added
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
6.  Delete gateway extension (Optional) if you need to re-deploy
    ```
    apic gateway-extensions:delete --scope org --org admin --gateway-service datapower-api-gateway --availability-zone availability-zone-default --server 127.0.0.1:2000
    ```
7. Login to the DataPower UI at `https://127.0.0.1:9091` 
    - Username `admin` 
    - Password `admin`. 
    - Graphical UI drop-down: `Web GUI`
    - Domain: apiconnect

8. In the navigation bar, select `API Connect Gateway Service`. In the User-defined Policy, select the `UDP Basic` policy in the drop-down and click **add**. 

9. Restart the API Connect Gateway service, Modify the **Administrate State** to **disabled** and click **Apply**. Change the state back to **Enabled** and click **Apply**.

10. Switch to the API Designer and click the existing **sports-api-1.0.0** API. Click the **Assemble** tab. You should see the `UDP Basic` policy
    ![alt](_images/UDPPolicy.jpg)

11. Drag and drop the UDP-Basic policy into the Assembly. Click the Policy and enter any credential value say `ozairs`. Save the policy.

12. Republish the API - in the top right-hand corner beside **Running**, click the Play icon or the wheel icon to republish the API. 

13. Test the API again using curl, you should get a JSON response, with the parameter value and the JSON body

```
> curl -X GET \
  'https://localhost:9444/localtest/sandbox/sports/teams?league=nba' \
  -H 'x-ibm-client-id: 36e2da0e888ffcb6a9160200e40c5a15' \
  -H 'x-ibm-client-secret: 3f4b5e8e835c4d21030a8b6436923fe8'

```

