web: bundle exec puma -C config/puma.rb
release: rails db:migrate
worker: bundle exec sidekiq -e $RAILS_ENV -q default 
