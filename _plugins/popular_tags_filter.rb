# frozen_string_literal: true

# Usage: {% assign tags = site.posts | popular_tags: 5 %}
# Returns tags used on more than 5 posts, sorted by frequency (highest first).
module PopularTagsFilter
  def popular_tags(posts, min_count = 5)
    counts = Hash.new(0)

    Array(posts).each do |post|
      tags = post.respond_to?(:data) ? post.data['tags'] : post['tags']
      next unless tags.is_a?(Array)

      tags.each do |tag|
        name = tag.to_s.strip
        counts[name] += 1 unless name.empty?
      end
    end

    threshold = min_count.to_i
    counts
      .select { |_, count| count > threshold }
      .sort_by { |tag, count| [-count, tag.downcase] }
      .map do |tag, count|
        {
          'name' => tag,
          'count' => count,
          'slug' => Jekyll::Utils.slugify(tag, mode: 'default')
        }
      end
  end
end

Liquid::Template.register_filter(PopularTagsFilter)
