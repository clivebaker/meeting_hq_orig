Rails.application.routes.draw do
  resources :organisations

  namespace :home do
    get 'index'
    get 'pricing'
    get 'about'
    namespace :account do
      get 'landing'
    end
    namespace :features do
      get 'actions'
      get 'agenda'
      get 'data_collection'
      get 'history'
      get 'minutes'
      get 'presentations'
      get 'slide_deck'
      get 'version_control'
    end
  end
  resources :components

  get 'resend_invite', to: 'users/resend_invitations#resend_invite', as: :resend_invite
  post 'resend_invite_thankyou', to: 'users/resend_invitations#resend_invite_thankyou', as: :invite_thankyou


  resources :master_slide_templates do 
    post 'component/:component_id/add', to: 'master_slide_templates#add_component', as: 'add_component'
  end
  post 'master_slide_template_component_update', to: 'master_slide_templates#update_component', as: 'update_component'
 

  devise_for :users, controllers: { invitations: 'users/invitations', registrations: 'users/registrations'}
  


  resources :organisations do
    resources :slide_templates do 
      post 'component/:component_id/add', to: 'slide_templates#add_component', as: 'add_component'
    end
    post 'master_slide_template/:master_slide_template_id', to: 'slide_templates#add_master', as: :add_master
    resources :business_units do
      post 'slide_template_component_update', to: 'slide_templates#update_component', as: 'update_component'

      post "user/:user_id/remove", to: 'users/business_units#remove', as: :remove_user
      post "user/:user_id/add", to: 'users/business_units#add', as: :add_user

      
      resources :meetings do
        resources :hosted_meetings do
          get :meeting_items
          post :add_test
          post :finish
          post 'finish_agenda/:current_agenda_id/next/:next_agenda_id', to: 'hosted_meetings#finish_agenda', as: :finish_agenda
          
        end
        resources :slides
        resources :agendas do
          post 'move/:direction', to: 'agendas#move', as: :move
          post 'complete', to: 'agendas#complete', as: :complete
        end
        resources :meeting_actions do
          post 'move/:direction', to: 'meeting_actions#move', as: :move
          post 'complete', to: 'meeting_actions#complete', as: :complete
        end
      end
    end
  end

  root "home#index"

end
