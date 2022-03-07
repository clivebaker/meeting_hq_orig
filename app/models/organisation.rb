class Organisation < ApplicationRecord

  has_many :organisation_users, dependent: :destroy #, -> {where(discarded_at: nil)}
  has_many :users, through: :organisation_users

  has_many :business_units

  default_scope { order(name: :asc) }

end
