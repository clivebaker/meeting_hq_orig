Rails.application.routes.draw do

  devise_for :users, controllers: { invitations: 'users/invitations' }


  resources :organisations do
  

  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  root "organisations#index"
end
