class Users::BusinessUnitsController < ApplicationController

  before_action :set_organisation
  before_action :set_business_unit

  def remove
  
    organisation_business_unit_user = BusinessUnitUser.find_by(user_id: params[:user_id], business_unit_id: params[:business_unit_id])
    organisation_business_unit_user.discard
      
    redirect_to organisation_business_unit_path(@organisation, @business_unit), notice: "User soft deleted from business_unit"
  
  end


  def add
  
    organisation_business_unit_user = BusinessUnitUser.find_by(user_id: params[:user_id], business_unit_id: params[:business_unit_id])
    organisation_business_unit_user.undiscard
      
    redirect_to organisation_business_unit_path(@organisation, @business_unit), notice: "User re-instated to business_unit"
  
  end

  private

    def set_business_unit
      @business_unit = BusinessUnit.find(params[:business_unit_id])
    end

    def set_organisation
      @organisation = Organisation.find(params[:organisation_id])
    end

end