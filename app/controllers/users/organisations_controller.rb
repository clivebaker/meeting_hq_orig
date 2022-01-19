class Users::OrganisationsController < ApplicationController

  before_action :set_organisation

  def remove
  
    organisation_user = OrganisationUser.find_by(user_id: params[:user_id], organisation_id: params[:organisation_id])
    organisation_user.discard
      
    redirect_to organisation_path(@organisation), notice: "User soft deleted from organisation"
  
  end


  def add
  
    organisation_user = OrganisationUser.find_by(user_id: params[:user_id], organisation_id: params[:organisation_id])
    organisation_user.undiscard
      
    redirect_to organisation_path(@organisation), notice: "User re-instated to organisation"
  
  end

  private

  def set_organisation
    @organisation = Organisation.find(params[:organisation_id])
  end

end