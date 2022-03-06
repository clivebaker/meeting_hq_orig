class Users::InvitationsController < Devise::InvitationsController
  
  layout 'devise'
  

  def new
    @organisation_id = params[:organisation_id]
    super
  end
  def create

    @organisation_id = params[:user][:organisation_id]

    invited_user = User.find_by(email: params[:user][:email])
    if invited_user.present?
      associate_organisation(invited_user, params[:user][:organisation_id])
      redirect_to organisation_path(@organisation_id), notice: 'This user has an account and has been added to your organisation' and return

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
        associate_organisation(invited_user, params[:user][:organisation_id])
        super
    #  else
    #    associate_organisation(invited_user, params[:user][:organisation_id])  
    #  end


    end

    def associate_organisation(user, organisation_id)
      @org_user = OrganisationUser.find_or_create_by(
        user_id: user.id,
        organisation_id: organisation_id,
        invited: true
      )
#      binding.pry
      @org_user.role = (@org_user.role + ['user']).uniq 
      @org_user.save

    end


    def after_invite_path_for(inviter, invitee)
      organisation_path(@org_user.organisation_id)
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