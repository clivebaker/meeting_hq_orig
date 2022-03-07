class Users::BusinessUnitsController < ApplicationController

  before_action :set_business_unit

  def remove
  
    business_unit_user = BusinessUnitUser.find_by(user_id: params[:user_id], business_unit_id: params[:business_unit_id])
    business_unit_user.discard
      
    redirect_to business_unit_path(@business_unit), notice: "User soft deleted from business_unit"
  
  end


  def add
  
    business_unit_user = BusinessUnitUser.find_by(user_id: params[:user_id], business_unit_id: params[:business_unit_id])
    business_unit_user.undiscard
      
    redirect_to business_unit_path(@business_unit), notice: "User re-instated to business_unit"
  
  end

  private

  def set_business_unit
    @business_unit = BusinessUnit.find(params[:business_unit_id])
  end

end