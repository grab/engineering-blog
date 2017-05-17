module Authors
  class Generator < Jekyll::Generator
    def generate(site)
      # Small method to augment the author object with posts authored by them.
      authors_posts = Hash.new { |h, k| h[k] = [] }
      site.posts.docs.each do |post|
        post['authors'].each do |author_id|
          authors_posts[author_id] << post
        end
      end

      site.data['authors'].each do |author_id, data|
        data['posts'] = authors_posts[author_id]
      end
    end
  end
end
