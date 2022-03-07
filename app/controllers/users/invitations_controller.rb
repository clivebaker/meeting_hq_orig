class Users::InvitationsController < Devise::InvitationsController
  
  layout 'devise'
  

  def new
    @business_unit_id = params[:business_unit_id]
    super
  end
  def create

    @business_unit_id = params[:user][:business_unit_id]

    invited_user = User.find_by(email: params[:user][:email])
    if invited_user.present?
      associate_business_unit(invited_user, params[:user][:business_unit_id])
      redirect_to business_unit_path(@business_unit_id), notice: 'This user has an account and has been added to your business_unit' and return

    else
      super

    end



end


  private

    # This is called when creating invitation.
    # It should return an instance of resource class.
    def invite_resource
      # skip sending emails on invite

     # invited_user = User.find_by(email: params[:user][:email])

     # if invited_user.blank?
        # invited_user.deliver_invitation if invited_user.present?
        invited_user = User.invite!({:email => params[:user][:email]}, current_user) 
        associate_business_unit(invited_user, params[:user][:business_unit_id])
        super
    #  else
    #    associate_business_unit(invited_user, params[:user][:business_unit_id])  
    #  end


    end

    def associate_business_unit(user, business_unit_id)
      @org_user = BusinessUnitUser.find_or_create_by(
        user_id: user.id,
        business_unit_id: business_unit_id,
        invited: true
      )
#      binding.pry
      @org_user.role = (@org_user.role + ['user']).uniq 
      @org_user.save

    end


    def after_invite_path_for(inviter, invitee)
      business_unit_path(@org_user.business_unit_id)
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