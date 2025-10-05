import scrapy
from datetime import datetime


class GratkaSpider(scrapy.Spider):
    """
    
    The following class scrapes car listings from Gratka.pl.
    It extracts details such as title, price, mileage, year, fuel type, transmission,
    and link to the listing.
    
    """
    
    name = "gratka"
    allowed_domains = ["gratka.pl", "www.gratka.pl"]
    start_urls = [
        f"https://gratka.pl/motoryzacja?page={i}"
        for i in range(1, 313)  # scrape pages 1 and 2
    ]

    def parse(self, response):
        """Parse listing (index) pages and follow links to details"""
        self.logger.info(f"Response status: {response.status}")

        listings = response.xpath('//div[@class="listing__teaserWrapper"]')

        for listing in listings:
            title = listing.xpath('.//h2[@class="teaserUnified__title"]/text()').get(default="").strip()
            price = listing.xpath('.//p[@class="teaserUnified__price"]/text()').get(default="").strip()
            link = listing.xpath('.//a[@class="teaserLink"]/@href').get()
            mileage = listing.xpath('.//li[contains(text(), "Przebieg")]/text()').get(default="")
            location = listing.xpath('.//span[@class="teaserUnified__location"]/text()').get(default="").strip()

            clean_price = price.replace("$", "").replace(",", "").strip() if price else "0"
            mileage_number = ''.join(filter(str.isdigit, mileage)) if mileage else "0"

            # send partial data + link to detail page
            yield scrapy.Request(
                response.urljoin(link),
                callback=self.parse_detail,
                meta={
                    "title": title,
                    "price": clean_price,
                    "mileage": mileage_number,
                    "location": location,
                },
            )

    def parse_detail(self, response):
        """Parse detail page for missing fields like year, fuel type, etc."""
        title = response.meta["title"]
        price = response.meta["price"]
        mileage = response.meta["mileage"]
        location = response.meta["location"]

        year = response.xpath('//li[span[contains(text(),"Rok produkcji")]]/b/text()').get(default="").strip()
        fuelType = response.xpath('//li[span[contains(text(),"Rodzaj paliwa")]]/b/text()').get(default="").strip()
        transmission = response.xpath('//li[span[contains(text(),"Skrzynia biegów")]]/b/text()').get(default="").strip()
        #vin = response.xpath('//li[span[contains(text(),"Numer VIN")]]/b/text()').get(default="").strip()

        yield {
            "title": title,
            "make": "",
            "model": "",
            "year": year,
            "trim": "",
            "price": price,
            "currency": "PLN",
            "mileage": mileage,
            "mileage_unit": "km",
            "region": location,
            "transmission": transmission,
            "fuelType": fuelType,
            #"vin": vin,
            "source": "gratka",
            "link": response.url,
            "scraped_at": datetime.utcnow().isoformat(),
            "manual_review": 0,
        }
