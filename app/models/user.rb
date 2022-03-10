class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :invitable, :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  validates_presence_of [:first_name, :last_name], on: [:update, :create], message: "can't be blank"

  has_many :business_unit_users       
  has_many :business_units, through: :business_unit_users
 
  has_many :organisation_users       
  has_many :organisations, through: :organisation_users
  

  def name
    ret = "#{first_name} #{last_name}" 
    ret = email if ret.blank?

    ret
  end

  def initials
    if first_name.present? and last_name.present?
      "#{first_name.first}#{last_name.first}".upcase
    end
  end


  def available_business_units
    binding.pry
    business_units.joins(:business_unit_users).where('business_unit_users.user_id = ? and discarded_at IS NULL', id)

  end

end
