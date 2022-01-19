class ApplicationController < ActionController::Base

  before_action :set_paper_trail_whodunnit

  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if:  :devise_controller?

  def current_organization
    @current_organization ||= current_user.organization
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:accept_invitation, keys: [:first_name, :last_name])
    devise_parameter_sanitizer.permit(:sign_up, keys: [:first_name, :last_name])
  end

end
