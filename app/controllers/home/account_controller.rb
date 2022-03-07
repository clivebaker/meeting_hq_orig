class Home::AccountController < ApplicationController
  
  layout 'application'

  def landing


    @organisations = current_user.organisations


  end

  
end
