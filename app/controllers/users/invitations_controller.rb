class Users::InvitationsController < Devise::InvitationsController
  private

    # This is called when creating invitation.
    # It should return an instance of resource class.
    def invite_resource
      # skip sending emails on invite

      invited_user = User.invite!({:email => params[:user][:email]}, current_user)
      OrganisationUser.create(
        user_id: invited_user.id,
        organisation_id: params[:user][:organisation_id],
        invited: true
      )

      super

    end

    # This is called when accepting invitation.
    # It should return an instance of resource class.
    def accept_resource
      resource = resource_class.accept_invitation!(update_resource_params)
      # Report accepting invitation to analytics

      resource
    end
end