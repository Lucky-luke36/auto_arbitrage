import scrapy
from datetime import datetime


class KijijiSpider(scrapy.Spider):
    name = "kijiji"
    allowed_domains = ["kijiji.ca"]
    start_urls = [
        f"https://www.kijiji.ca/b-autos-camions/quebec/page-{i}/c174l9001?view=list"
        for i in range(1, 474)  # scrape pages 1 to 5
    ]

    def parse(self, response):
        #TODO: Add docstring
        """sumary_line
        
        Keyword arguments:
        argument -- description
        Return: return_description
        """
        
        self.logger.info(f"Response status: {response.status}")
        
        listings = response.xpath('//*[@id="base-layout-main-wrapper"]/div[4]/div[1]/div[2]/div[3]/ul/li')

        for listing in listings:
            try:
                title = listing.xpath(".//h3/a/text()").get(default="").strip()
                price = listing.xpath('.//section/div[1]/div[2]/div[1]/div[1]/div/p/text()').get(default="").strip()
                link = listing.xpath(".//h3/a/@href").get(default="").strip()

                features = listing.xpath('.//div[contains(@class,"ffNurV")]/div/p/text()').getall()
                features = [f.strip() for f in features]

                mileage = ""
                transmission = ""
                fuelType = ""

                for f in features:
                    f_lower = f.lower()
                    if "km" in f_lower or "miles" in f_lower:
                        mileage = f
                    elif f_lower in ["automatic", "manual", "cvt"]:  # extend as needed
                        transmission = f
                    elif f_lower in ["gas", "diesel", "electric", "hybrid"]:
                        fuelType = f


                clean_price = price.replace("$", "").replace(",", "").strip() if price else "0"
                mileage_number = ''.join(filter(str.isdigit, mileage)) if mileage else "0"
                mileage_unit = "km" if "km" in mileage else "miles" if mileage and "miles" in mileage else ""

                yield {
                    'title': title,
                    'make': '',
                    'model': '',
                    'year': '',
                    'trim': '',
                    'price': clean_price,
                    'currency': 'CAD',
                    'mileage': mileage_number,
                    'mileage_unit': mileage_unit,
                    'region': 'quebec',
                    'transmission': transmission,
                    'fuelType': fuelType,
                    'source': 'kijiji',
                    'link': response.urljoin(link),
                    'scraped_at': datetime.utcnow().isoformat(),
                    'manual_review': 0,
                }
            except Exception as e:
                    self.logger.error(f"Error parsing listing: {e}")
    

        next_page = response.css('li[data-testid="pagination-next-link"] a::attr(href)').get()
        self.logger.info(f"Next page URL: {next_page}")

        if next_page:
            yield response.follow(next_page, callback=self.parse)