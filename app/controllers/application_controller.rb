class ApplicationController < ActionController::Base

  before_action :authenticate_user!

  def current_organization
    @current_organization ||= current_user.organization
  end


end
