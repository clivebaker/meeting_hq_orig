class Organisation < ApplicationRecord

  has_many :organisation_users, dependent: :destroy #, -> {where(discarded_at: nil)}
  has_many :users, through: :organisation_users

  has_many :business_units
  has_many :slide_templates

  default_scope { order(name: :asc) }
  

def available_business_units(current_user)

  business_units.joins(:business_unit_users).where('business_unit_users.user_id = ? and discarded_at IS NULL', current_user.id)

end


end
