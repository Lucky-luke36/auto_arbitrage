import scrapy


class KijijiSpider(scrapy.Spider):
    name = "kijiji"
    allowed_domains = ["kijiji.ca"]
    start_urls = ["https://www.kijiji.ca/b-autos-camions/quebec/c174l9001?view=list"]

    def parse(self, response):
        self.logger.info(f"Response status: {response.status}")

        if response.status == 200:
            self.logger.info("Successfully reached the page!")
        else:
            self.logger.warning("Failed to reach the page!")
        
        listings = response.xpath('//*[@id="base-layout-main-wrapper"]/div[4]/div[1]/div[2]/div[3]/ul/li')

        for listing in listings:
            title = listing.xpath(".//h3/a/text()").get()
            price = listing.xpath(".//div[contains(@class,'currentPrice')]/p/text()").get()
            link = listing.xpath(".//h3/a/@href").get()
            mileage = listing.xpath(".//div[contains(@class,'attributeValue')][1]/text()").get()
            transmission = listing.xpath(".//div[contains(@class,'attributeValue')][2]/text()").get()
            gas = listing.xpath(".//div[contains(@class,'attributeValue')][3]/text()").get()

            self.logger.warning(f"Listing link: {title}, Price: {price}, URL: {link}, Mileage: {mileage}, Transmission: {transmission}, GasType: {gas}")
        
        self.logger.warning(f"Listings retrieved: {len(listings)}")