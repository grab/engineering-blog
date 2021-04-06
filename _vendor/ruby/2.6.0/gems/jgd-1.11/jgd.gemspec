# coding: utf-8
require 'English'
Gem::Specification.new do |s|
  s.specification_version = 2 if s.respond_to? :specification_version=
  if s.respond_to? :required_rubygems_version=
    s.required_rubygems_version = Gem::Requirement.new('>= 0')
  end
  s.rubygems_version = '2.2.2'
  s.required_ruby_version = '>= 1.9.3'
  s.name = 'jgd'
  s.version = '1.11'
  s.license = 'MIT'
  s.summary = 'Jekyll Github Deploy'
  s.description = 'Automated deployment of your Jekyll blog to Github Pages'
  s.authors = ['Yegor Bugayenko']
  s.email = 'yegor@tpc2.com'
  s.homepage = 'http://github.com/yegor256/jekyll-github-deploy'
  s.files = `git ls-files`.split($RS)
  s.executables = s.files.grep(%r{^bin/}) { |f| File.basename(f) }
  s.test_files = s.files.grep(%r{^(test|spec|features)/})
  s.rdoc_options = ['--charset=UTF-8']
  s.extra_rdoc_files = ['README.md', 'LICENSE.txt']
  s.add_runtime_dependency('trollop', '2.1.2')
  s.add_runtime_dependency('jekyll', '>=1.5.1')
  s.add_development_dependency 'coveralls', '0.7.0'
  s.add_development_dependency 'rdoc', '3.11'
  s.add_development_dependency 'minitest', '5.4.0'
  s.add_development_dependency 'rubocop', '0.46.0'
  s.add_development_dependency 'rubocop-rspec', '1.8.0'
  s.add_development_dependency 'rspec-rails', '2.13'
end
