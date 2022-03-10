web: bundle exec puma -C config/puma.rb
js: yarn build
release: rails db:migrate
worker: bundle exec sidekiq -e $RAILS_ENV -q default 
