class Users::InvitationsController < Devise::InvitationsController
  
  layout 'application'
  

  def new
    @business_unit_id = params[:business_unit_id]
    @organisation_id = params[:organisation_id]
    @organisation = Organisation.find(@organisation_id)
    super
  end
  def create

    @business_unit_id = params[:user][:business_unit_id]
    @organisation_id = params[:user][:organisation_id]

    invited_user = User.find_by(email: params[:user][:email])
    if invited_user.present?

      associate_business_unit(invited_user, @organisation_id, @business_unit_id)
      redirect_to organisation_business_unit_path(@organisation_id, @business_unit_id), notice: 'This user has an account and has been added to your business_unit' and return

    else
      
      super

    end

end


  private

    def invite_resource

      @business_unit_id = params[:user][:business_unit_id]
      @organisation_id = params[:user][:organisation_id]
  

        invited_user = User.invite!({:email => params[:user][:email]}, current_user) 
        associate_business_unit(invited_user, @organisation_id, @business_unit_id)
        super

    end

    def associate_business_unit(user, organisation_id, business_unit_id)
      @business_user = BusinessUnitUser.find_or_create_by(
        user_id: user.id,
        business_unit_id: business_unit_id,
        invited: true,
        role: [:user].as_json
      )
#      binding.pry
      @business_user.role = (@business_user.role + ['user']).uniq 
      @business_user.save
      @org_user = OrganisationUser.find_or_create_by(
        user_id: user.id,
        organisation_id: organisation_id,
        invited: true,
        role: [:user].as_json
      )
#      binding.pry
      @org_user.role = (@org_user.role + ['user']).uniq 
      @org_user.save

    end


    def after_invite_path_for(inviter, invitee)
      organisation_business_unit_path(@org_user.organisation_id, @business_user.business_unit_id)
    end

    def after_accept_path_for(resource) 
      home_account_landing_path
    end

    # This is called when accepting invitation.
    # It should return an instance of resource class.
    def accept_resource
      resource = resource_class.accept_invitation!(update_resource_params)
      # Report accepting invitation to analytics

      resource
    end
end