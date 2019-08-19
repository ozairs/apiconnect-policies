<xsl:stylesheet version="1.0" 
     xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
     xmlns:dp="http://www.datapower.com/extensions"
     xmlns:apim="http://www.ibm.com/apimanagement" 
     extension-element-prefixes="dp"
     exclude-result-prefixes="dp"
> 

  <xsl:template match="/">
    <!-- Set variable to indicate an the nature of the error -->
    <xsl:variable name="errorMsg" select="dp:variable('var://service/error-message')"/>
    <xsl:variable name="errorSubcode" select="dp:variable('var://service/error-subcode')"/>

    <!-- now that we've collected the reason, tell the framework -->
    <xsl:choose>
        <!-- aaa failure? -->
    	<xsl:when test="$errorSubcode='0x01d30001' or $errorSubcode='0x01d30002' ">
                 <error>
                    <msg>Error during execution of AAA Policy</msg>
                    <desc><xsl:value-of select="$errorMsg"/></desc>
                    <code><xsl:value-of select="$errorSubcode"/></code>\
                 </error>
	</xsl:when>
	<xsl:otherwise>
                 <error>
                    <msg>Error during execution of non-AAA Policy</msg>
                    <desc><xsl:value-of select="$errorMsg"/></desc>
                    <code><xsl:value-of select="$errorSubcode"/></code>\
                 </error>
	</xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>