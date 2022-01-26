Rails.application.routes.draw do

  devise_for :users, controllers: { invitations: 'users/invitations', registrations: 'users/registrations'}
  

  resources :organisations do
    post "user/:user_id/remove", to: 'users/organisations#remove', as: :remove_user
    post "user/:user_id/add", to: 'users/organisations#add', as: :add_user
    resources :meetings do
      resources :agendas do
        post 'move/:direction', to: 'agendas#move', as: :move
        post 'complete', to: 'agendas#complete', as: :complete
      end
      resources :meeting_actions do
        post 'move/:direction', to: 'agendas#move', as: :move
        post 'complete', to: 'agendas#complete', as: :complete
      end
    end
  end

  root "organisations#index"

end
