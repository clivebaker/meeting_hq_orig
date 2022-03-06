class Users::ResendInvitationsController < ApplicationPublicController


  layout 'devise'
  
  def resend_invite
    
  end
 
  def resend_invite_thankyou
    invited_user = User.find_by(email: params[:email])
    if invited_user.present?
      invited_user.invite!
    end
  end

end