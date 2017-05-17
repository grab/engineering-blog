module Authors
  class Generator < Jekyll::Generator
    def generate(site)
      # Small method to augment the author object with posts authored by them.
      authors_posts = {}
      site.posts.docs.each do |post|
        post['authors'].each do |author_id|
          if !authors_posts.include?(author_id)
            authors_posts[author_id] = []
          end
          authors_posts[author_id].push(post)
        end
      end

      site.data['authors'].each do |author_id, data|
        data['posts'] = authors_posts[author_id]
      end
    end
  end
end
