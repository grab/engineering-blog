# frozen_string_literal: true

require 'json'
require 'net/http'
require 'rexml/document'
require 'uri'

module GrabCareers
  class JobsFeedGenerator < Jekyll::Generator
    safe true
    priority :lowest

    TECH_CATEGORIES = [
      'Engineering',
      'Data Science',
      'Data Analytics',
      'Security',
      'Technology Solutions',
      'UX and Design',
      'Product'
    ].freeze

    def generate(site)
      config = site.config.fetch('careers', {})
      feed_url = config['jobs_feed_url']
      return if feed_url.nil? || feed_url.empty?

      feed_type = config.fetch('jobs_feed_type', 'xml').to_s.downcase
      jobs = fetch_jobs(feed_url, feed_type, config)
      payload = {
        'generated_at' => Time.now.utc.iso8601,
        'source' => feed_url,
        'jobs' => jobs,
        'tag_categories' => config.fetch('tag_categories', {}),
        'engineering_jobs_url' => config.fetch(
          'engineering_jobs_url',
          'https://www.grab.careers/en/teams/engineering/'
        )
      }

      site.pages << JobsJsonPage.new(site, site.source, payload)
      Jekyll.logger.info 'Jobs feed:', "Loaded #{jobs.length} roles from Grab Careers"
    rescue StandardError => e
      Jekyll.logger.warn 'Jobs feed:', "Could not fetch careers feed (#{e.message}). Related jobs will be empty until the next build."
    end

    private

    def fetch_jobs(feed_url, feed_type, config)
      uri = URI(feed_url)
      response = Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
        http.open_timeout = 15
        http.read_timeout = 60
        request = Net::HTTP::Get.new(uri)
        request['x-ph'] = 'internal' if feed_type == 'umbraco'
        request['Accept'] = feed_type == 'json' ? 'application/json' : '*/*'
        http.request(request)
      end

      raise "HTTP #{response.code}" unless response.is_a?(Net::HTTPSuccess)

      case feed_type
      when 'json'
        parse_jobs_json(response.body)
      when 'umbraco'
        parse_jobs_umbraco(response.body, config)
      else
        parse_jobs_xml(response.body)
      end
    end

    def parse_jobs_xml(xml)
      document = REXML::Document.new(xml)
      jobs = []

      REXML::XPath.each(document, '//job') do |job_node|
        category = text_for(job_node, 'category')
        next unless TECH_CATEGORIES.include?(category)

        city = text_for(job_node, 'city')
        country = text_for(job_node, 'country')
        title = text_for(job_node, 'title')
        description = strip_html(text_for(job_node, 'description'))

        jobs << {
          'title' => title,
          'url' => text_for(job_node, 'url'),
          'category' => category,
          'location' => [city, country].reject(&:empty?).join(', '),
          'search_text' => "#{title} #{description}".downcase
        }
      end

      jobs
    end

    def parse_jobs_json(body)
      payload = JSON.parse(body)
      listings = payload['jobs'] || payload['results'] || payload
      raise 'JSON feed did not contain a jobs array' unless listings.is_a?(Array)

      listings.filter_map do |job|
        category = job['category'] || job['team'] || job['department']
        next unless TECH_CATEGORIES.include?(category)

        title = job['title'].to_s
        description = strip_html(job['description'].to_s)
        city = job['city'].to_s
        country = job['country'].to_s

        {
          'title' => title,
          'url' => job['url'] || job['link'],
          'category' => category,
          'location' => [city, country].reject(&:empty?).join(', '),
          'search_text' => "#{title} #{description}".downcase
        }
      end
    end

    def parse_jobs_umbraco(html, config)
      document = REXML::Document.new("<wrapper>#{html}</wrapper>")
      jobs = []

      REXML::XPath.each(document, '//a[contains(@class,"js-view-job") or contains(@href,"/jobs/")]') do |link|
        title = link.text.to_s.strip
        url = link.attributes['href'].to_s
        next if title.empty? || url.empty?

        url = "https://www.grab.careers#{url}" unless url.start_with?('http')

        jobs << {
          'title' => title,
          'url' => url,
          'category' => config.fetch('default_job_category', 'Engineering'),
          'location' => '',
          'search_text' => title.downcase
        }
      end

      jobs.uniq { |job| job['url'] }
    end

    def text_for(node, element_name)
      element = node.elements[element_name]
      return '' unless element

      element.text.to_s.strip
    end

    def strip_html(html)
      html.gsub(/<[^>]+>/, ' ').gsub(/\s+/, ' ').strip[0, 1200]
    end
  end

  class JobsJsonPage < Jekyll::Page
    def initialize(site, base, payload)
      @site = site
      @base = base
      @dir = ''
      @name = 'jobs.json'

      process(@name)
      self.data = {
        'layout' => nil,
        'sitemap' => false
      }
      self.content = JSON.pretty_generate(payload)
    end

    def render_layouts?
      false
    end

    def convert?
      false
    end
  end
end
