class ApplicationController < ActionController::Base

  before_action :set_paper_trail_whodunnit

  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if:  :devise_controller?
  # before_action :set_business_units

  # def set_business_units
  #   @business_units = current_user.organizations
  # end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:accept_invitation, keys: [:first_name, :last_name])
    devise_parameter_sanitizer.permit(:sign_up, keys: [:first_name, :last_name])
  end


  def after_sign_in_path_for(resource)
    home_account_landing_path # your path
  end


end
