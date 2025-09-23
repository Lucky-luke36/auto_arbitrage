import scrapy


class AutotraderplSpider(scrapy.Spider):
    name = "autoTraderPL"
    allowed_domains = ["www.autotrader.pl"]
    start_urls = ["https://www.autotrader.pl/"]

    def parse(self, response):
        pass
