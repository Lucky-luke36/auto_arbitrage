import scrapy


class KijijiSpider(scrapy.Spider):
    name = "kijiji"
    allowed_domains = ["kijiji.ca"]
    start_urls = ["https://www.kijiji.ca/b-autos-camions/quebec/c174l9001?view=list"]

    def parse(self, response):
        self.logger.info(f"Response status: {response.status}")
        
        listings = response.xpath('//*[@id="base-layout-main-wrapper"]/div[4]/div[1]/div[2]/div[3]/ul/li')

        for listing in listings:
            title = listing.xpath(".//h3/a/text()").get()
            price = listing.xpath('.//section/div[1]/div[2]/div[1]/div[1]/div/p/text()').get()
            link = listing.xpath(".//h3/a/@href").get()
            mileage = listing.xpath('.//section/div[1]/div[2]/div[1]/div[2]/div[1]/p/text()').get()
            transmission = listing.xpath('//section/div[1]/div[2]/div[1]/div[2]/div[2]/p/text()').get()
            fuelType = listing.xpath('//section/div[1]/div[2]/div[1]/div[2]/div[3]/p/text()').get()

            #self.logger.warning(f"Listing link: {title}, Price: {price}, URL: {link}, Mileage: {mileage}, Transmission: {transmission}, GasType: {gas}")

            clean_price = price.replace("$", "").replace(",", "").strip() if price else "0"
            currency = "CAD"
            mileage_number = ''.join(filter(str.isdigit, mileage)) if mileage else "0"
            mileage_unit = "km" if "km" in mileage else "miles" if mileage and "miles" in mileage else ""

            yield {
                'title': title,
                'price': clean_price,
                'currency': currency,
                'mileage': mileage_number,
                'mileage_unit': mileage_unit,
                'transmission': transmission,
                'fuelType': fuelType,
                'link': response.urljoin(link),
            }
        
        self.logger.warning(f"Listings retrieved: {len(listings)}")

        next_page = response.xpath("//a[@title='Next']/@href").get()
        
        #if next_page:
        #    yield response.follow(next_page, callback=self.parse) 