<xsl:stylesheet version="1.0" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:dp="http://www.datapower.com/extensions" extension-element-prefixes="dp" exclude-result-prefixes="dp">

    <xsl:template match="/">
        <!-- db2 on cloud requires quotes on column names due to csv import tool -->
        <xsl:variable name="query" select="'SELECT &quot;NBA_Champion&quot;, &quot;Year&quot; FROM HKN34861.NBA_FINALS WHERE &quot;Year&quot;=2019'"/>
        <xsl:variable name="result" select="dp:sql-execute('ibm-cloud-db2',$query)" />
        <response>
            <xsl:copy-of select="$result" />
            <xsl:copy-of select="." />
        </response>
    </xsl:template>

</xsl:stylesheet>