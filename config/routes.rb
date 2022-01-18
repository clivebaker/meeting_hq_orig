Rails.application.routes.draw do

  devise_for :users, controllers: { invitations: 'users/invitations' }

  resources :organisations do
    resources :meetings do
      resources :agendas
      resources :meeting_actions
    end
  end

  root "organisations#index"

end
