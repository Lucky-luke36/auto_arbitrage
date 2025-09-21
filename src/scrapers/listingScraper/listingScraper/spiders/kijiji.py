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
