Rails.application.routes.draw do

  devise_for :users, controllers: { invitations: 'users/invitations' }

  resources :organisations do
    post "user/:user_id/remove", to: 'users/organisations#remove', as: :remove_user
    post "user/:user_id/add", to: 'users/organisations#add', as: :add_user
    resources :meetings do
      resources :agendas
      resources :meeting_actions
    end
  end

  root "organisations#index"

end
