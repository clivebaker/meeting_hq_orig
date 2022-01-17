class Organisation < ApplicationRecord


  validates_presence_of :name, on: [:update, :create], message: "can't be blank"
  validates_uniqueness_of :name, on: [:update, :create], message: "must be unique"

  has_many :organisation_users
  has_many :users, through: :organisation_users

end
