class ApplicationPublicController < ActionController::Base

  before_action :check_login

  def check_login
      if current_user
        redirect_to home_account_landing_path and return
      end
  end

end
