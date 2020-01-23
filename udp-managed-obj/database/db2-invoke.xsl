<xsl:stylesheet version="1.0" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:apim="http://www.ibm.com/apimanagement"
    xmlns:dp="http://www.datapower.com/extensions" extension-element-prefixes="dp" exclude-result-prefixes="dp">

    <xsl:include href="store:///dp/apim.custom.xsl" />

    <xsl:variable name="sql-datasource" select="apim:getContext('param1')" />
    <xsl:variable name="input" select="apim:getContext('param2')" />
    <!--<xsl:variable name="sql-datasource" select="'ibm-cloud-db2'" />-->

    <xsl:template match="/">
    
        <xsl:if test="string-length($sql-datasource) = 0">
            <xsl:call-template name="apim:error">
                <xsl:with-param name="httpCode" select="'500'" />
                <xsl:with-param name="httpReasonPhrase" select="'Invalid parameter'" />
                <xsl:with-param name="errorMessage" select="'Invalid or empty SQL Datasource parameter'" />
            </xsl:call-template>
        </xsl:if>

        <!-- db2 on cloud requires quotes on column names due to csv import tool -->
        <xsl:variable name="query" select="'SELECT &quot;NBA_Champion&quot;, &quot;Year&quot; FROM HKN34861.NBA_FINALS WHERE &quot;Year&quot;=2019'"/>
        <!--<xsl:variable name="query" select="concat('SELECT &quot;NBA_Champion&quot;, &quot;Year&quot; FROM HKN34861.NBA_FINALS WHERE &quot;NBA_Champion&quot; LIKE', $input)"/>-->
        <xsl:variable name="result" select="dp:sql-execute($sql-datasource, $query)" />
        <response>
            <xsl:copy-of select="$result" />
            <xsl:copy-of select="." />
        </response>
    </xsl:template>

</xsl:stylesheet>